import { DeepMockProxy, mockDeep } from 'jest-mock-extended';
import { NsError } from '../../../ns-error';
import { ApiSpecsService } from '../api-specs.service';
import { Server } from './server.model';
import { Variable } from './variable.model';

jest.mock('./path.model');
jest.mock('./server.model');

describe('Variable', () => {
  let parent: DeepMockProxy<Server>;
  let specService: DeepMockProxy<ApiSpecsService>;

  beforeEach(() => {
    parent = mockDeep<Server>({ namespace: ['test'], url: '/test/{testVar}' });
    specService = mockDeep<ApiSpecsService>();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  it('throws an error when creating without name', () => {
    expect(() => new Variable(parent, undefined as any, null, specService)).toThrow(new NsError([], '[name] must be a string and not empty'));
  });

  it('throws an error when creating with empty name', () => {
    expect(() => new Variable(parent, '', null, specService)).toThrow(new NsError([], '[name] must be a string and not empty'));
  });

  it('throws an error when creating without rawData', () => {
    expect(() => new Variable(parent, 'testVar', null, specService)).toThrow(new NsError([], 'this is not based on an object'));
  });

  it('throws an error when creating with stringified rawData', () => {
    expect(() => new Variable(parent, 'testVar', 'null', specService)).toThrow(new NsError([], 'this is not based on an object'));
  });

  it('throws an error when creating with a name that is not part of the parents url', () => {
    expect(() => new Variable(parent, 'testVar2', {}, specService)).toThrow(
      new NsError([], 'the server url [/test/{testVar}] does not contain the placeholder {testVar2}'),
    );
  });

  it('throws an error when creating without a default', () => {
    expect(() => new Variable(parent, 'testVar', {}, specService)).toThrow(new NsError([], '[default] mandatory property missing or empty'));
  });

  it('throws an error when creating with empty default', () => {
    expect(() => new Variable(parent, 'testVar', { default: {} }, specService)).toThrow(new NsError([], '[default] must be a string and not empty'));
  });

  it('throws an error when creating with default that is not part of the enum', () => {
    expect(() => new Variable(parent, 'testVar', { default: 'one', enum: ['two', 'three'] }, specService)).toThrow(
      new NsError([], '[default] "one" is not a valid value. (Valid values: ["two", "three"])'),
    );
  });

  it('throws an error when creating with a description that is not a string', () => {
    expect(() => new Variable(parent, 'testVar', { default: 'one', enum: ['one', 'two', 'three'], description: {} }, specService)).toThrow(
      new NsError([], '[description] must be null or a string'),
    );
  });

  it('throws an error when creating with enum that is not an array', () => {
    expect(() => new Variable(parent, 'testVar', { default: 'one', enum: { values: ['one', 'two', 'three'] } }, specService)).toThrow(
      new NsError([], '[enum] must be an array'),
    );
  });

  it('throws an error when creating with enum value that is not a string', () => {
    expect(() => new Variable(parent, 'testVar', { default: 'one', enum: ['one', 2, 'three'] }, specService)).toThrow(
      new NsError([], '[enum[1]] must be a string and not empty'),
    );
  });

  it('creates a new variable', () => {
    const variable = new Variable(parent, 'testVar', { default: 'one', description: 'numbers' }, specService);

    expect(variable.parent).toEqual(parent);
    expect(variable.namespace).toEqual(['test', 'variable: testVar']);
    expect(variable.name).toEqual('testVar');
    expect(variable.description).toEqual('numbers');
    expect(variable.default).toEqual('one');
    expect(variable.enum).toBeNull();
  });

  it('follows $ref', () => {
    specService.followRef.mockReturnValueOnce({ default: 'one', enum: ['one', 'two', 'three'] });
    const variable = new Variable(parent, 'testVar', { $ref: '#/varaibles/numbers' }, specService);

    expect(variable.parent).toEqual(parent);
    expect(variable.namespace).toEqual(['test', 'variable: testVar']);
    expect(variable.name).toEqual('testVar');
    expect(variable.description).toBeNull();
    expect(variable.default).toEqual('one');
    expect(variable.enum).toEqual(['one', 'two', 'three']);
    expect(specService.followRef).toBeCalledWith(variable, '#/varaibles/numbers');
  });
});
