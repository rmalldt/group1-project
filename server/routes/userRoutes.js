const {Router} = require ("express")
const userController = require("../controllers/userController")

const userRouter = Router()

userRouter.get("/", userController.index)
userRouter.get("/:id", userController.show)
userRouter.patch("/:id", userController.update)
userRouter.delete("/:id", userController.destroy)
userRouter.post("/signup", userController.signup);
userRouter.post("/login", userController.login);

module.exports = userRouter;