import Button from "./Button";
import { useNavigate } from "react-router-dom";
import Avatar from "./Avatar";

const User = ({ user }) => {
  const navigate = useNavigate();
  return (
    <div className="flex justify-between mt-2">
      <div className="flex items-center">
        <Avatar 
          name={`${user.firstName} ${user.lastName}`}
          size="md"
          gradient="blue"
          className="mr-2"
        />
        <div className="flex flex-col justify-center font-semibold">
          <div>
            {user.firstName} {user.lastName}
          </div>
        </div>
      </div>
      <div className="flex flex-col justify-center h-full">
        <Button
          label={"Send Money"}
          onClick={() =>
            navigate("/send?id=" + user.id + "&name=" + user.firstName)
          }
        />
      </div>
    </div>
  );
};

export default User;
