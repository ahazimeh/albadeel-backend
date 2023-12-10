"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const requireLogin = (req, res, next) => {
    console.log("asdasd");
    if (!req.user) {
        return res.status(401).send({ error: "You must log in!" });
    }
    next();
};
exports.default = requireLogin;
//# sourceMappingURL=requireLogin.js.map