export const buildCancelResponse = (jobId: string) => ({
  success: true,
  jobId,
  status: 'cancelled'
});
