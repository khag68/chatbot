import Elysia from "elysia"

const corsMiddleware = (app: Elysia) => {
  return app.onRequest(({ set }) => {
    set.headers['Access-Control-Allow-Origin'] = '*'
    set.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS'
    set.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization, x-api-key'
  })
}

export default corsMiddleware;