type StringToTuple<S extends string> = S extends `${infer Alpha}${infer Rest}`
  ? [Alpha, ...StringToTuple<Rest>]
  : [];

type LengthOfString<S extends string> = StringToTuple<S>['length'];

type c =
  StringToTuple<'aaaaaaaaaaaaggggggggggggggggggggkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa'>;
