import { listReportBlueprints } from '../src/services/report-blueprints.js';

const fail = (message: string) => {
  throw new Error(message);
};

const assert = (condition: boolean, message: string) => {
  if (!condition) fail(message);
};

const blueprints = listReportBlueprints();

assert(blueprints.length > 0, 'No report blueprints found.');

for (const blueprint of blueprints) {
  const sectionIds = new Set(blueprint.sections.map((section) => section.id));
  const defaultSelected = blueprint.sections.filter((section) => section.defaultSelected);

  assert(defaultSelected.length > 0, `Blueprint ${blueprint.reportType} has no default sections.`);
  assert(
    blueprint.inputs.some((input) => input.id === 'companyName'),
    `Blueprint ${blueprint.reportType} is missing companyName input.`
  );

  blueprint.sections.forEach((section) => {
    const deps = section.dependencies || [];
    deps.forEach((dep) => {
      assert(
        sectionIds.has(dep),
        `Blueprint ${blueprint.reportType} has dependency "${dep}" missing from section list.`
      );
    });
  });

  const defaultSet = new Set(defaultSelected.map((section) => section.id));
  blueprint.sections.forEach((section) => {
    const deps = section.dependencies || [];
    deps.forEach((dep) => {
      assert(
        defaultSet.has(dep) || !section.defaultSelected,
        `Blueprint ${blueprint.reportType} default section "${section.id}" is missing dependency "${dep}".`
      );
    });
  });
}

console.log(`Blueprint validation passed for ${blueprints.length} report types.`);
