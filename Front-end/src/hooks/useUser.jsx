import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getMe, updateUser } from "../services/auth";

// Fetch user data
const fetchUser = async () => {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("No token");
  const res = await getMe(token);
  return res.data;
};

// Set user profile update
const setUser = async (user) => {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("No token");
  return await updateUser(user, token).then((res) => res.data);
};

export const useUser = () => {
  const queryClient = useQueryClient();

  // Use `useQuery` to fetch user data
  const userQuery = useQuery({
    queryKey: ["user"],
    queryFn: fetchUser,
    retry: false, // Don't retry on unauthorized
    staleTime: 1000 * 60 * 60, // Cache the data for 60 minutes
    cacheTime: 1000 * 60 * 10, // Cache for 10 minutes to prevent refetching on every component mount
  });

  // Use `useMutation` for updating user data
  const updateUserMutation = useMutation({
    mutationFn: setUser, // Mutation function (your setUser function)
    onSuccess: () => {
      // Refetch user data after successful mutation
      queryClient.invalidateQueries(["user"]);
    },
  });

  return {
    userQuery,
    updateUserMutation,
  };
};
