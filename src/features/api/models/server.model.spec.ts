import { DeepMockProxy, mockDeep } from 'jest-mock-extended';
import { NsError } from '../../../ns-error';
import { ApiSpecsService } from '../api-specs.service';
import { Server } from './server.model';
import { ApiSpec } from './spec.model';
import { Variable } from './variable.model';

jest.mock('./variable.model');

describe('Response', () => {
  let specService: DeepMockProxy<ApiSpecsService>;
  let parent: DeepMockProxy<ApiSpec>;

  beforeEach(() => {
    specService = mockDeep<ApiSpecsService>();
    parent = mockDeep<ApiSpec>({ namespace: ['test'] });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  it('throws an error when creating without url', () => {
    expect(() => new Server(parent, {}, specService)).toThrow(new NsError([], '[url] mandatory property missing or empty'));
  });

  it('throws an error when creating with object path', () => {
    expect(() => new Server(parent, { url: {} }, specService)).toThrow(new NsError([], '[url] must be a string that starts with http:// or https://'));
  });

  it('throws an error when creating with empty path', () => {
    expect(() => new Server(parent, { url: '' }, specService)).toThrow(new NsError([], '[url] mandatory property missing or empty'));
  });

  it('throws an error when creating with empty path', () => {
    expect(() => new Server(parent, { url: 'localhost' }, specService)).toThrow(new NsError([], '[url] must be a string that starts with http:// or https://'));
  });

  it('throws an error when creating without rawData', () => {
    expect(() => new Server(parent, null, specService)).toThrow(new NsError([], 'this is not based on an object'));
  });

  it('throws an error when creating with stringified rawData', () => {
    expect(() => new Server(parent, 'null', specService)).toThrow(new NsError([], 'this is not based on an object'));
  });

  it('throws an error when creating with varaibles object', () => {
    expect(() => new Server(parent, { url: 'http://localghost', variables: [] }, specService)).toThrow(
      new NsError([], '[variables] must be a map string -> object'),
    );
  });

  it('throws an error when creating with varaibles object', () => {
    expect(() => new Server(parent, { url: 'http://localghost', variables: { spooky: '' } }, specService)).toThrow(
      new NsError([], '[variables] must be a map string -> object'),
    );
  });

  it('creates a new server', () => {
    const variableMock = mockDeep<Variable>();
    jest.mocked(Variable).mockReturnValueOnce(variableMock);
    const server = new Server(parent, { url: 'http://localghost', description: 'invisible but there', variables: { spooky: { var: 'spooky?' } } }, specService);

    expect(server.namespace).toEqual(['test', 'server: http://localghost']);
    expect(server.parent).toEqual(parent);
    expect(server.variables).toEqual([variableMock]);
    expect(server.description).toEqual('invisible but there');
    expect(Variable).toBeCalledWith(server, 'spooky', { var: 'spooky?' }, specService);
  });

  it('follows $ref', () => {
    specService.followRef.mockReturnValueOnce({ url: 'http://localghost' });

    const server = new Server(parent, { $ref: '#/servers/localghost' }, specService);

    expect(server.namespace).toEqual(['test', 'server: http://localghost']);
    expect(server.parent).toEqual(parent);
    expect(server.description).toBeNull();
    expect(server.variables).toEqual([]);

    expect(specService.followRef).toBeCalledWith(server, '#/servers/localghost');
  });
});
