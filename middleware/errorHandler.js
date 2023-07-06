const errorHandler = (error, request, response, next) => {
  console.log(error.message);

  if (error.name === "CastError") {
    response.status(400).json({ error: "malformatted id" });
  } else if (error.name === "ValidationError") {
    response.status(400).json({ error: error.message });
  } else {
    next(error);
  }
};

module.exports = errorHandler;
