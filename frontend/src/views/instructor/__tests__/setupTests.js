// setupTests.js
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';

// Create a new instance of AxiosMockAdapter
const mock = new MockAdapter(axios);

// Optional: Configure global error handling
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Setup global mocks before each test
beforeEach(() => {
  // Reset all mocks before each test
  mock.reset();
});

// Example mocks
mock.onGet('/some-endpoint').reply(200, { data: 'some data' });
mock.onPost('/user/token/refresh/').reply(200, { token: 'new_token' });

// Export the mock for usage in tests
export { mock };
