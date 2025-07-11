import Button from "./Button";
import { useNavigate } from "react-router-dom";

const User = ({ user }) => {
  const navigate = useNavigate();
  return (
    <div className="flex justify-between mt-2">
      <div className="flex">
        <div className="rounded-full h-12 w-12 bg-slate-200 flex justify-center mt-1 mr-2">
          <div className="flex flex-col justify-center h-full text-xl">
            {user.firstName.charAt(0).toUpperCase()}
          </div>
        </div>
        <div className="flex flex-col justify-center h-full font-semibold">
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
