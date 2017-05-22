'use strict';

const spawn = require('child_process').spawn
const gearman = require('gearman')
const crypto = require('crypto')
const _ = require('lodash')

if (!(_.has(process.env, 'GITHUB_WEBHOOK_SECRET_TOKEN')
  && process.env.GITHUB_WEBHOOK_SECRET_TOKEN !== null
  && process.env.GITHUB_WEBHOOK_SECRET_TOKEN !== '')) {
  throw new Error('Missing environment variable GITHUB_WEBHOOK_SECRET_TOKEN')
}

const worker = gearman('gearman', 4730)

// handle jobs assigned by the server
worker.on('JOB_ASSIGN', (job) => {
  console.log(job.func_name + ' job assigned to this worker')

  function sendWorkComplete() {
    // notify the server the job is done
    worker.sendWorkComplete(job.handle)

    // go back to sleep, telling the server we're ready for more work
    worker.preSleep()
  }

  const decodedJobPayload = JSON.parse(job.payload.toString())

  if (!(_.has(decodedJobPayload, 'signature')
    && decodedJobPayload !== null
    && decodedJobPayload !== '')) {
    console.log('Missing payload signature')
    return sendWorkComplete()
  }

  const payload = decodedJobPayload.payload

  const payloadStr = JSON.stringify(payload)

  const hmac = crypto.createHmac('sha1', process.env.GITHUB_WEBHOOK_SECRET_TOKEN)

  hmac.update(payloadStr)

  const signature = 'sha1=' + hmac.digest('hex')

  try {
    if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(decodedJobPayload.signature))) {
      console.log(`payload signature "${decodedJobPayload.signature}" does not match computed signature "${signature}"`)
      return sendWorkComplete()
    }
  } catch (e) {
    console.log(`Error validating payload signature "${decodedJobPayload.signature}" against computed signature "${signature}"`, e)

    return sendWorkComplete()
  }

  const commandArguments = [
    '/home/satis/app/bin/satis',
    'build',
    '-vvv',
    '--repository-url'
  ]

  if (_.has(payload, 'repository.html_url')) {
    commandArguments.push(payload.repository.html_url)
    console.log(`Updating info for ${payload.repository.html_url} package only`)
  } else {
    console.log('Missing repository.html_url')

    return sendWorkComplete()
  }

  commandArguments.push('/home/satis/conf/satis.json')
  commandArguments.push('/home/satis/app/web')

  const spawned = spawn('/usr/bin/php', commandArguments)

  const fullCommand = '/usr/bin/php ' + commandArguments.join(' ')

  console.log(`Executing command ${fullCommand}`)

  spawned.stdout.on('data', (data) => {
    process.stdout.write(data)
  })

  spawned.stderr.on('data', (data) => {
    process.stderr.write(data)
  })

  spawned.on('close', (code) => {
    sendWorkComplete()

    console.log(`child process exited with code ${code}`)
  })
})

// grab a job when the server signals one is available
worker.on('NOOP', () => {
  worker.grabJob()
})

worker.connect(() => {
  console.log('Connected to Gearman')

  worker.addFunction('build')

  // tell the server the worker is going to sleep, waiting for work
  worker.preSleep()
})
