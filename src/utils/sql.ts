export const addWhereCondition = (
  conditions: string[],
  values: unknown[],
  column: string,
  value: unknown,
) => {
  values.push(value);
  conditions.push(`${column} = $${values.length}`);
};
