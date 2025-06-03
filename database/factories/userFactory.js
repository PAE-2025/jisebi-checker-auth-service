const { faker } = require("@faker-js/faker");
const bcrypt = require("bcryptjs");

/**
 * Membuat data pengguna dummy.
 * @param {object} overrides - Properti untuk mengganti nilai default.
 * @returns {Promise<object>} Objek data pengguna dengan password yang sudah di-hash.
 */
const createUserFactory = async (overrides = {}) => {
  const defaultPassword =
    overrides.password ||
    faker.internet.password({ length: 10, memorable: false, prefix: "!Aa1" });
  const hashedPassword = await bcrypt.hash(defaultPassword, 12);

  return {
    username:
      faker.internet
        .userName()
        .toLowerCase()
        .replace(/[^a-z0-9]/gi, "")
        .substring(0, 15) + faker.string.alphanumeric(3),
    password: hashedPassword,
    isAdmin: faker.datatype.boolean(0.1),
    createdAt: faker.date.past(),
    ...overrides,
  };
};

module.exports = { createUserFactory };
