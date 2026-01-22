type AdminGroup = {
  id: string;
  name: string;
  slug: string;
  memberCount?: number;
};

type DeletedUser = {
  groups?: Array<{ id: string }>;
};

export const applyUserDeletionToGroups = (
  groups: AdminGroup[],
  deletedUser: DeletedUser | null | undefined
): AdminGroup[] => {
  if (!deletedUser?.groups?.length) {
    return groups;
  }

  const deletedGroupIds = new Set(deletedUser.groups.map((group) => group.id));

  return groups.map((group) => {
    if (!deletedGroupIds.has(group.id)) {
      return group;
    }

    const currentCount = typeof group.memberCount === 'number' ? group.memberCount : 0;
    return {
      ...group,
      memberCount: Math.max(0, currentCount - 1),
    };
  });
};
