const validate = (schema) => (req, res, next) => {
  try {
    const parsed = schema.parse({
      body: req.body,
      query: req.query,
      params: req.params,
    });

    if (parsed.body !== undefined) req.body = parsed.body;
    if (parsed.query !== undefined) req.query = parsed.query;
    if (parsed.params !== undefined) req.params = parsed.params;

    next();
  } catch (err) {
    if (err.errors) {
      const formattedErrors = err.errors.map((e) => ({
        field: e.path.filter((p) => p !== 'body' && p !== 'query' && p !== 'params').join('.') || 'root',
        message: e.message,
      }));

      return res.status(400).json({
        success: false,
        data: null,
        message: 'Validation failed',
        details: formattedErrors,
      });
    }
    next(err);
  }
};

module.exports = validate;
