import { DeepMockProxy, mockDeep } from 'jest-mock-extended';
import { NsError } from '../../../ns-error';
import { ApiSpecsService } from '../api-specs.service';
import { Parameter, ParameterIn } from './parameter.model';
import { Path } from './path.model';

describe('Parameter', () => {
  let specService: DeepMockProxy<ApiSpecsService>;
  let parent: DeepMockProxy<Path>;

  beforeEach(() => {
    specService = mockDeep<ApiSpecsService>();
    parent = mockDeep<Path>({ namespace: ['test'] });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  it('throws an error when creating without rawData', () => {
    expect(() => new Parameter(parent, null, specService)).toThrow(new NsError([], 'this is not based on an object'));
  });

  it('throws an error when creating with stringified rawData', () => {
    expect(() => new Parameter(parent, 'null', specService)).toThrow(new NsError([], 'this is not based on an object'));
  });

  it('throws an error when creating without property "name"', () => {
    expect(() => new Parameter(parent, {}, specService)).toThrow(new NsError([], '[name] mandatory property missing or empty'));
  });

  it('throws an error when creating without property "name"', () => {
    expect(() => new Parameter(parent, { name: 'filter' }, specService)).toThrow(new NsError([], '[in] mandatory property missing or empty'));
  });

  it('throws an error when creating with invalid value for property "in"', () => {
    expect(() => new Parameter(parent, { name: 'filter', in: 'query!' }, specService)).toThrow(
      new NsError([], '[in] "query!" is not a valid value for [ParameterIn]. (Valid values: ["path", "query", "header"])'),
    );
  });

  it('throws an error when creating without property "required"', () => {
    expect(() => new Parameter(parent, { name: 'filter', in: 'query' }, specService)).toThrow(
      new NsError([], '[required] mandatory property missing or empty'),
    );
  });

  it('throws an error when creating with invalid value for property "required"', () => {
    expect(() => new Parameter(parent, { name: 'filter', in: 'query', required: 'yes' as any }, specService)).toThrow(
      new NsError([], '[required] is not a boolean but a string'),
    );
  });

  it('throws an error when creating without property "required"', () => {
    expect(() => new Parameter(parent, { name: 'filter', in: 'query' }, specService)).toThrow(
      new NsError([], '[required] mandatory property missing or empty'),
    );
  });

  it('throws an error when creating without property "schema"', () => {
    expect(() => new Parameter(parent, { name: 'filter', in: 'query', required: true }, specService)).toThrow(
      new NsError([], '[schema] mandatory property missing or empty'),
    );
  });

  it('throws an error when creating with invalid value for property "schema"', () => {
    expect(() => new Parameter(parent, { name: 'filter', in: 'query', required: true, schema: JSON.stringify({ type: 'string' }) }, specService)).toThrow(
      new NsError([], '[schema] is not a object but a string'),
    );
  });

  it('creates a new Parameter', () => {
    const parameter = new Parameter(parent, { name: 'filter', in: 'query', required: true, schema: { type: 'string' }, example: 'a>5' }, specService);
    expect(parameter.name).toEqual('filter');
    expect(parameter.paramIn).toEqual(ParameterIn.Query);
    expect(parameter.required).toEqual(true);
    expect(parameter.example).toEqual('"a>5"');
    expect(parameter.schema).toEqual(JSON.stringify({ type: 'string' }));
  });

  it('creates a new Parameter with a $ref to its schema', () => {
    specService.followRef.mockReturnValueOnce({ type: 'string' });

    const parameter = new Parameter(parent, { name: 'filter', in: 'query', required: true, schema: { $ref: '#/schema/bar' }, example: 'a>5' }, specService);
    expect(parameter.name).toEqual('filter');
    expect(parameter.paramIn).toEqual(ParameterIn.Query);
    expect(parameter.required).toEqual(true);
    expect(parameter.example).toEqual('"a>5"');
    expect(parameter.schema).toEqual(JSON.stringify({ type: 'string' }));
    expect(specService.followRef).toBeCalledWith(parameter, '#/schema/bar');
    expect(specService.followRef).toBeCalledTimes(1);
  });

  it('follows $ref', () => {
    specService.followRef.mockReturnValueOnce({ name: 'filter', in: 'query', required: true, schema: { type: 'string' } });

    const parameter = new Parameter(parent, { $ref: '#/parameters/filter' }, specService);
    expect(parameter.name).toEqual('filter');
    expect(parameter.paramIn).toEqual(ParameterIn.Query);
    expect(parameter.required).toEqual(true);
    expect(parameter.example).toBeNull();
    expect(parameter.schema).toEqual(JSON.stringify({ type: 'string' }));
    expect(specService.followRef).toBeCalledWith(parameter, '#/parameters/filter');
  });
});
