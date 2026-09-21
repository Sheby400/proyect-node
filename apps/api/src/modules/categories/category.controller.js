import * as categoryService
  from './category.service.js'

export async function listCategories(
  req,
  res
) {
  const data =
    await categoryService
      .listCategories()

  return res.status(200).json({
    success:
      true,

    data,

    meta: {
      count:
        data.length,

      requestId:
        req.id
    }
  })
}

export async function getCategory(
  req,
  res
) {
  const data =
    await categoryService
      .getCategory(
        req.validated.params.id
      )

  return res.status(200).json({
    success:
      true,

    data,

    meta: {
      requestId:
        req.id
    }
  })
}

export async function createCategory(
  req,
  res
) {
  const data =
    await categoryService
      .createCategory(
        req.validated.body
      )

  return res.status(201).json({
    success:
      true,

    data,

    meta: {
      requestId:
        req.id
    }
  })
}

export async function updateCategory(
  req,
  res
) {
  const data =
    await categoryService
      .updateCategory(
        req.validated.params.id,
        req.validated.body
      )

  return res.status(200).json({
    success:
      true,

    data,

    meta: {
      requestId:
        req.id
    }
  })
}

export async function deleteCategory(
  req,
  res
) {
  await categoryService
    .deleteCategory(
      req.validated.params.id
    )

  return res
    .status(204)
    .send()
}
