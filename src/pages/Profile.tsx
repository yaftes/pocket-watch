import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar"
import { Button } from "../components/ui/button"
import { Separator } from "../components/ui/separator"
import { Input } from "../components/ui/input"
import { Label } from "../components/ui/label"
import { useEffect, useState } from "react"
import { getEmail, getUserInfo, isLoggedIn } from "../api/auth_api"
import { useNavigate } from "react-router-dom"

const Profile = () => {

  const [email ,setEmail] =  useState("");
  const [fullName,setFullName] = useState("");
  const [error,setError] = useState("");
  const navigate = useNavigate();


  const fetchUserData = async () => {
  setError('');
  try {
    if (!(await isLoggedIn())) {
      navigate('/login', { replace: true });
    }
    setFullName(await getUserInfo());
    setEmail(await getEmail());
  } catch (e) {
    setError(e instanceof Error ? e.message : String(e));
  }
};



  useEffect(()=>{
    fetchUserData();
  },[])

  return (
    <div className="flex justify-center items-center min-h-screen bg-muted/30 p-6">
      <Card className="w-full max-w-md shadow-lg rounded-2xl">
        <CardHeader className="flex flex-col items-center space-y-3">
          <Avatar className="h-20 w-20">
            <AvatarImage src="/avatars/default.png" alt="User Avatar" />
            <AvatarFallback>{fullName[0]}</AvatarFallback>
          </Avatar>
          <CardTitle className="text-xl font-semibold">{fullName}</CardTitle>
          <p className="text-sm text-muted-foreground">{email}</p>
        </CardHeader>

        <Separator className="my-2" />

        <CardContent className="space-y-4">
          <div className="grid gap-4">
            <div className="grid gap-1">
              <Label htmlFor="name"></Label>
              <Input id="name" defaultValue={fullName} disabled/>
            </div>
            <div className="grid gap-1">
              <Label htmlFor="email">Email</Label>
              <Input id="email" defaultValue={email} disabled/>
            </div>
            <div className="grid gap-1">
              <Label htmlFor="role">Role</Label>
              <Input id="role" defaultValue="user" disabled />
            </div>
          </div>

          <Button className="w-full mt-4">Update Profile</Button>
        </CardContent>
      </Card>
    </div>
  )
}

export default Profile
