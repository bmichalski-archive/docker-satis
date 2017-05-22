'use strict';

const Hapi = require('hapi')
const gearman = require('gearman')
const uniqid = require('uniqid')

const client = gearman('gearman', 4730)

client.connect(() => {
  console.log('Connected to Gearman')
})

const server = new Hapi.Server()

server.connection({
  host: '0.0.0.0',
  port: 8000
})

server.route({
  method: 'POST',
  path:'/build',
  handler: (request, reply) => {
    client.submitJob(
      'build',
      JSON.stringify({
        signature: request.headers['x-hub-signature'],
        payload: request.payload
      }),
      {
        background: true,
        unique_id: uniqid('build:')
      }
    )

    return reply({ 'status': 'ok' })
  }
})

server.start((err) => {
  if (err) {
    throw err
  }

  console.log('Server running at:', server.info.uri)
})
