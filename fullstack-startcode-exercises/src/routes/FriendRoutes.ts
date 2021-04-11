import { Router } from "express"
const router = Router();
 
import facade from "../facades/DummyDB-Facade"
import { IFriend } from '../interfaces/IFriend';
 
router.get("/all", async (req: any, res) => {
  const friends = await facade.getAllFriends();
  const friendsDTO = friends.map(friend=>{
    const {firstName, lastName} = friend
    return {firstName,lastName} 
  });
  res.json(friendsDTO);
})

router.get("/findby-email/:userMail", async (req, res, next) => {
    const userMail = req.params.userMail;
   
    const friend = await facade.getFriend(userMail);
    if (friend == null) {
      return next(new Error("user not found"))
    }
    const { firstName, lastName, email } = friend;
    const friendDTO = { firstName, lastName, email }
    res.json(friendDTO);
  })

  router.post("/add", async (req: any, res, next) => {
    const friend : IFriend = {
      id : req.body.id,
      firstName : req.body.firstName,
      lastName : req.body.lastName,
      email : req.body.email,
      password : req.body.password
    };
    
    const newFriend = await facade.addFriend(friend);
    if (newFriend == null) {
      return next(new Error("user not added"));
    }
    const { firstName, lastName, email } = newFriend;
    const friendDTO = { firstName, lastName, email }
    res.json(friendDTO);
  });

  router.delete("/delete/:useremail", async(req, res, next) => {
    const userEmail = req.params.useremail;
     const friend = await facade.deleteFriend(userEmail);
     if (friend == null) {
       return next(new Error("user not found"));
     }
     const { firstName, lastName, email } = friend;
     const friendDTO = { firstName, lastName, email }
     res.json(friendDTO);
  });
   
 
export default router