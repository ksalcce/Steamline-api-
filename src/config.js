module.exports = {
    PORT: process.env.PORT || 8000,
    NODE_ENV: process.env.NODE_ENV || "development",
	CLIENT_ORIGIN: process.env.CLIENT_ORIGIN || "*",
	DATABASE_URL: process.env.DATABASE_URL || 'postgresql://dunder_mifflin:1@localhost/streamline',
	TEST_DATABASE_URL: process.env.TEST_DATABASE_URL || 'postgresql://dunder_mifflin:1@localhost/streamline-test'
};
