import { Router } from "express"
const router = Router();
import { ApiError } from "../errors/errors"
import FriendFacade from "../facades/friendFacade"
import { IFriend } from "../interfaces/IFriend";
import base64 from "base-64";
const debug = require("debug")("friend-routes")

let facade: FriendFacade;

// Initialize facade using the database set on the application object
router.use(async (req, res, next) => {
  if (!facade) {
    const db = req.app.get("db")
    debug("Database used: " + req.app.get("db-type"))
    facade = new FriendFacade(db)
  }
  next()
})

// This does NOT require authentication in order to let new users create themself
router.post('/', async function (req, res, next) {
  try {
    let newFriend = req.body;
    const status = await facade.addFriend(newFriend)
    res.json({ status })
  } catch (err) {
    debug(err)
    if (err instanceof ApiError) {
      next(err)
    } else {
      next(new ApiError(err.message, 400));
    }
  }
})

router.post("/login", async (req, res, next) => {
  const { userName, password } = req.body;
  const user = await facade.getVerifiedUser(userName, password)
  if (!user) {
    return next(new ApiError("Failed to login", 400))
  }
  const base64AuthString = "Basic " + base64.encode(userName + ":" + password)
  res.json({ base64AuthString, user: user.email, role: user.role})
})

// ALL ENDPOINTS BELOW REQUIRES AUTHENTICATION

import authMiddleware from "../middleware/basic-auth"
const USE_AUTHENTICATION = !process.env["SKIP_AUTHENTICATION"];

if (USE_AUTHENTICATION) {
  router.use(authMiddleware);
}

router.get("/all", async (req: any, res) => {
  const friends = await facade.getAllFriendsV2();

  const friendsDTO = friends.map(friend => {
    const { firstName, lastName, email } = friend
    return { firstName, lastName, email }
  })
  res.json(friendsDTO);
})

/**
 * authenticated users can edit himself
 */
router.put('/editme', async function (req: any, res, next) {
  try {
    if (!USE_AUTHENTICATION) {
      throw new ApiError("This endpoint requires authentication", 500)
    }
    const email = req.credentials.userName; //GET THE USERS EMAIL FROM SOMEWHERE (req.params OR req.credentials.userName)
    const friend: IFriend = req.body;
    const modifiedCount = await facade.editFriend(email, friend);
    res.json(modifiedCount);
  } catch (err) {
    debug(err)
    if (err instanceof ApiError) {
      return next(err)
    }
    next(new ApiError(err.message, 400));
  }
})

router.get("/me", async (req: any, res, next) => {
  try {
    if (!USE_AUTHENTICATION) {
      throw new ApiError("This endpoint requires authentication", 500)
    }
    const userName = req.credentials.userName; //GET THE USERS EMAIL FROM SOMEWHERE (req.params OR req.credentials.userName)
    const friend = await facade.getFriendFromEmail(userName);
    if (friend == null) {
      throw new ApiError("User not found", 404)
    }
    const { firstName, lastName, email, role } = friend;
    const friendDTO = { firstName, lastName, email }
    res.json(friendDTO);

  } catch (err) {
    next(err)
  }
})

//These endpoint requires admin rights

//An admin user can fetch everyone
router.get("/find-user/:email", async (req: any, res, next) => {

  try {
    if (USE_AUTHENTICATION && !req.credentials.role || req.credentials.role !== "admin") {
      throw new ApiError("Not Authorized", 401)
    }
    const userId = req.params.email;
    const friend = await facade.getFriendFromEmail(userId);
    if (friend == null) {
      throw new ApiError("user not found", 404)
    }
    const { firstName, lastName, email, role } = friend;
    const friendDTO = { firstName, lastName, email }
    res.json(friendDTO);
  } catch (err) {
    next(err)
  }
})


//An admin user can edit everyone
router.put('/:email', async function (req: any, res, next) {

  try {
    if (USE_AUTHENTICATION && !req.credentials.role || req.credentials.role !== "admin") {
      throw new ApiError("Not Authorized", 401)
    }
    const email = req.params.email; //GET THE USERS EMAIL FROM SOMEWHERE (req.params OR req.credentials.userName)
    let newFriend: IFriend = req.body;
    const modifiedCount = await facade.editFriend(email, newFriend);
    res.json(modifiedCount);

  } catch (err) {
    debug(err)
    if (err instanceof ApiError) {
      return next(err)
    }
    next(new ApiError(err.message, 400));
  }
})

router.delete('/:email', async function(req: any, res, next) {
    try {
        if (USE_AUTHENTICATION && !req.credentials.role || req.credentials.role !== "admin") {
          throw new ApiError("Not Authorized", 401)
        }
        const email = req.params.email; //GET THE USERS EMAIL FROM SOMEWHERE (req.params OR req.credentials.userName)
        const deleted = await facade.deleteFriend(email);
        res.json(deleted);    
      } catch (err) {
        debug(err)
        if (err instanceof ApiError) {
          return next(err)
        }
        next(new ApiError(err.message, 400));
      }
})

export default router