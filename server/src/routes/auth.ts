import { isEmpty, validate } from "class-validator";
import { Request, Response, Router } from "express";
import { User } from "../entities/User";
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import cookie from 'cookie'
import userMiddleware from '../middlewares/user'
import authMiddleware from '../middlewares/auth'

const router = Router();

const mapError = (errors: Object[]) => {
  return errors.reduce((prev: any, err: any) => {
    prev[err.property] = Object.entries(err.constraints)[0][1];
    return prev;
  });
};

const me = async (_: Request, res: Response)=>{
  return res.json(res.locals.user)
}
const register = async (req: Request, res: Response) => {
  const { email, username, password } = req.body;

  try {
    let errors: any = {};

    // 이메일과 이름이 사용중인지 체크한다.
    const emailUser = await User.findOneBy({ email });
    const usernameUser = await User.findOneBy({ username });

    if (emailUser) errors.email = "해당 이메일은 이미 사용중입니다.";
    if (usernameUser) errors.username = "해당 이름은 이미 사용중입니다.";

    // 에러가 있으면 다음으로 넘어가지말고 error를 리턴한다.
    if (Object.keys(errors).length > 0) {
      return res.status(400).json(errors);
    }

    // 에러가 없을 경우 DB에 저장한다.

    const user = new User();
    user.email = email;
    user.username = username;
    user.password = password;

    // 엔티티에 정해놓은 조건으로 user 데이터 유효성 검사
    errors = await validate(user);
    if (errors.length > 0) return res.status(400).json(mapError(errors));

    await user.save();
    return res.json(user);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error });
  }
};

const login = async (req: Request, res: Response) => {
  const { username, password } = req.body;
  try {
    let errors: any = {};

    if (isEmpty(username)) errors.username = "아이디는 비워둘 수 없습니다.";
    if (isEmpty(password)) errors.password = "비밀번호는 비워둘 수 없습니다.";

    if(Object.keys(errors).length > 0) {
        return res.status(400).json(errors)
    }

    // DB에서 유저를 찾는다.
    const user = await User.findOneBy({username});

    if(!user) return res.status(404).json({username: "사용자 이름이 등록되지 않았습니다."})

    //유저가 있다면 비밀번호를 확인한다.
    const passwordMatches = await bcrypt.compare(password, user.password)

    if(!passwordMatches) {
        return res.status(401).json({password: "비밀번호가 틀렸습니다.."})
    }


    //비밀번호가 맞다면 토큰 생성
    const token = jwt.sign({username},process.env.JWT_SECRET)

    //쿠키에 저장
    res.set("Set-Cookie",cookie.serialize("token",token,{
        httpOnly:true,
        maxAge: 60 * 60 * 24 * 7,
        path:"/",
    }))

    return res.json({user,token})

    
    
  } catch (error) {
    console.error(error)
    return res.status(500).json(error)
  }
};
router.get("/me",userMiddleware,authMiddleware,me)
router.post("/register", register);
router.post("/login", login);

export default router;
