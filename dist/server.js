import app from "./app.js";
import config from "./config/index.js";
import { initDB } from "./db/index.js";
const main = () => {
    initDB();
    app.listen(config.port, () => {
        console.log(`Example app listening on port ${config.port}`);
    });
};
main();
//# sourceMappingURL=server.js.map