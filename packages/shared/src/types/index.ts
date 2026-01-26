/** biome-ignore-all lint/suspicious/noExplicitAny: allow ahy type use while tools type */
export type BrandedTypeBuilder<T, Brand extends string> = T & {
	readonly __brand: Brand;
};

export type Discard<T, K extends keyof any> = T extends any
	? Omit<T, K>
	: never;
