import { useEffect, useState } from "react";
import { getAccessToken } from "../store/authTokens";

export const useAuthStatus = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasToken, setHasToken] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const bootstrapAuth = async () => {
      try {
        const accessToken = await getAccessToken();
        if (isMounted) {
          setHasToken(!!accessToken);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    bootstrapAuth();

    return () => {
      isMounted = false;
    };
  }, []);

  return { isLoading, hasToken };
};
