import { Request, Response, Router } from "express";
import Comment from "../entities/Comment";
import  Post  from "../entities/Post";
import { User } from "../entities/User";
import userMiddleWare from "../middlewares/user";

const router = Router();

const getUserData = async (req:Request, res:Response)=> {
    try {
        const user = await User.findOneOrFail({
            where: {username: req.params.username},
            select: ["username","createdAt"]
        })

        const posts = await Post.find({
            where: {username: user.username},
            relations: ["comments","vote","sub"]
        })

        const comments = await Comment.find({
            where: {username: user.username},
            relations: ["post"]
        })

        if(res.locals.user){
            const {user} = res.locals;
            posts.forEach((p)=>p.setUserVote(user));
            comments.forEach(c => c.setUserVote(user));
        }

        let userData: any[] = [];

        posts.forEach(p=> userData.push({type: "Post", ...p.toJSON()}));
        comments.forEach(c=> userData.push({type: "Comment", ...c.toJSON()}));

        //최신순으로 정렬
        userData.sort((a,b)=>{
            if(b.createdAt > a.createdAt) return 1
            if(b.createdAt < a.createdAt) return -1
            return 0
        })
        return res.json({user, userData})
    
    } catch (error) {
        console.log(error);
        return res.status(500).json({error: "getUserData Error"})
    }
}

export default router

router.get("/:username",userMiddleWare,getUserData)