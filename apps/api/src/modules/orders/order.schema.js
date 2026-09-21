import {
  z
} from 'zod'

const empty =
  z.object({}).default({})

export const createOrderSchema =
  z.object({
    body:
      empty,

    params:
      empty,

    query:
      empty
  })

export const listOrdersSchema =
  z.object({
    body:
      empty,

    params:
      empty,

    query:
      empty
  })

export const getOrderSchema =
  z.object({
    body:
      empty,

    params:
      z.object({
        id:
          z.string()
            .trim()
            .min(1)
      }),

    query:
      empty
  })
