import assert from 'node:assert/strict';
import { applyUserDeletionToGroups } from './adminUsers.ts';

const runTest = (name, fn) => {
  try {
    fn();
    console.log(`ok - ${name}`);
  } catch (error) {
    console.error(`not ok - ${name}`);
    throw error;
  }
};

runTest('decrements memberCount for each group the deleted user belonged to', () => {
  const groups = [
    { id: 'alpha', name: 'Alpha', slug: 'alpha', memberCount: 3 },
    { id: 'bravo', name: 'Bravo', slug: 'bravo', memberCount: 1 },
    { id: 'charlie', name: 'Charlie', slug: 'charlie', memberCount: 5 }
  ];
  const deletedUser = {
    id: 'user-1',
    email: 'user-1@example.com',
    role: 'MEMBER',
    groups: [
      { id: 'alpha', name: 'Alpha', slug: 'alpha' },
      { id: 'charlie', name: 'Charlie', slug: 'charlie' }
    ]
  };

  const updated = applyUserDeletionToGroups(groups, deletedUser);

  assert.equal(updated.find((group) => group.id === 'alpha')?.memberCount, 2);
  assert.equal(updated.find((group) => group.id === 'bravo')?.memberCount, 1);
  assert.equal(updated.find((group) => group.id === 'charlie')?.memberCount, 4);
});

runTest('clamps memberCount at zero when values are missing or already zero', () => {
  const groups = [
    { id: 'alpha', name: 'Alpha', slug: 'alpha' },
    { id: 'bravo', name: 'Bravo', slug: 'bravo', memberCount: 0 }
  ];
  const deletedUser = {
    id: 'user-2',
    email: 'user-2@example.com',
    role: 'MEMBER',
    groups: [
      { id: 'alpha', name: 'Alpha', slug: 'alpha' },
      { id: 'bravo', name: 'Bravo', slug: 'bravo' }
    ]
  };

  const updated = applyUserDeletionToGroups(groups, deletedUser);

  assert.equal(updated.find((group) => group.id === 'alpha')?.memberCount, 0);
  assert.equal(updated.find((group) => group.id === 'bravo')?.memberCount, 0);
});
