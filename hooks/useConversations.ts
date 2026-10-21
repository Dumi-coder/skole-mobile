import { useQuery } from "@tanstack/react-query";

import { getConversations } from "@/services/messages";

export function useConversations() {
  return useQuery({
    queryKey: ["conversations"],
    queryFn: getConversations,
  });
}
