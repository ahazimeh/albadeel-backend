const requireLogin = (req: any, res: any, next: any) => {
  console.log("asdasd");
  if (!req.user) {
    return res.status(401).send({ error: "You must log in!" });
  }
  next();
};

export default requireLogin;
