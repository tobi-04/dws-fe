// Global state for banned user detection
const isBanned = ref(false);

export const useBannedUser = () => {
  const setBanned = (value: boolean) => {
    isBanned.value = value;
  };

  const checkBannedError = (error: unknown): boolean => {
    if (error instanceof Error) {
      const message = error.message.toLowerCase();
      if (
        message.includes("locked") ||
        message.includes("banned") ||
        message.includes("account has been locked")
      ) {
        setBanned(true);
        return true;
      }
    }
    return false;
  };

  return {
    isBanned: computed(() => isBanned.value),
    setBanned,
    checkBannedError,
  };
};
