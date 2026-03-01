export const asyncHandler = async <T>(promise: Promise<T>) => {
  try {
    const res = await promise;
    return [res, null] as const;
  } catch (error: any) {
    return [null, error] as const;
  }
};
