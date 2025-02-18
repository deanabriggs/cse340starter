/* ***************************
 *  Build to test error handling - will not actually create anything
 * ************************** */
exports.buildProblem = function (req, res, next) {
  try {
    throw new Error("This is an intentional error");
  } catch (error) {
    next(error);
  }
};
