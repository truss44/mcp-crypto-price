CoinCap API 3.0
CoinCap is a useful tool for real-time pricing and market activity for over 1,000 cryptocurrencies. By collecting exchange data from thousands of markets, we are able to offer transparent and accurate data on asset price and availability.

Our API will offer insight into exactly which exchanges and markets contribute to our pricing.

For all endpoints, a single page offers 100 responses by default and supports up to 2,000 responses per page upon requests.

You can purchase API access, generate keys, and monitor API usage via our dashboard at: pro.coincap.io/dashboard
Migrating from API 2.0 to API 3.0
We are currently in the process of sunsetting API 2.0 and migrating all users over to the API 3.0. Care has been taken to ensure that the migration process is simple and smooth for all of our existing API users. However, there are some elements that have changed and should be taken into consideration when migrating to API 3.0:
The Rest API base URL has changed from api.coincap.io/v2/ to: rest.coincap.io/v3/

The Web-socket base URL has changed from wss://ws.coincap.io/ to: wss://wss.coincap.io/

All calls now require a bearer token in the header or URL. For example:

api.coincap.io/v2/assets (Old Api)

rest.coincap.io/v3/assets?apiKey=YourApiKey (New Api)

See Swagger documentation below for more examples

Slug & Asset Id are the same thing

Aside from the four points listed here, we have kept all other features of API 3.0 the same as API 2.0.

For any questions regarding migration to the new API, suggestions on new API features, or bugs/issues you notice, please reach out to us on Discord
.
Over the next couple weeks, we will start rate limiting the old V2 API and returning a 429 error message notifying users that they are required to migrate. These error messages will increase in frequency until all calls to the old V2 API return this error message. At that point, the V2 API will be deactivated permanently.