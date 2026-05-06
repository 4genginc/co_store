import { currentUser } from "@clerk/nextjs/server";
import { LuUser } from "react-icons/lu";

export default async function UserIcon() {
  const user = await currentUser();
  if (user?.imageUrl) {
    return (
      <img
        src={user.imageUrl}
        alt={user.fullName ?? "user avatar"}
        className="size-6 rounded-full object-cover"
      />
    );
  }
  return <LuUser className="size-6 bg-primary rounded-full text-white" />;
}
