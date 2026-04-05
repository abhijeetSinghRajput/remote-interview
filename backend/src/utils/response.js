export const sendSuccess = (
  res,
  data = {},
  message = "Success",
  statusCode = 200,
) => {
  return res.status(statusCode).json({
    success: true,
    statusCode,
    message,
    data,
  });
};

export const sendError = (
  res,
  message = "Something went wrong",
  statusCode = 500,
  errors = [],
) => {
  return res.status(statusCode).json({
    success: false,
    statusCode,
    message,
    errors,
  });
};
