import { DeepMockProxy, mockDeep } from 'jest-mock-extended';
import { NsError } from '../../../ns-error';
import { ApiSpecsService } from '../api-specs.service';
import { Callback } from './callback.model';
import { HttpContent } from './http-content.model';
import { Method, Methods } from './method.model';
import { Parameter } from './parameter.model';
import { Path } from './path.model';
import { Response } from './response.model';

jest.mock('./response.model');
jest.mock('./parameter.model');
jest.mock('./http-content.model');
jest.mock('./callback.model');

describe('Method', () => {
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

  it('throws an error when creating with invalid method', () => {
    expect(() => new Method(parent, 'destroy' as any, {}, specService)).toThrow(
      new NsError([], '[method] "destroy" is not a valid value for [ApiMethod]. (Valid values: ["get", "put", "post", "delete", "head"])'),
    );
  });

  it('throws an error when creating without rawData', () => {
    expect(() => new Method(parent, Methods.post, null, specService)).toThrow(new NsError([], 'this is not based on an object'));
  });

  it('throws an error when creating with stringified rawData', () => {
    expect(() => new Method(parent, Methods.post, 'null', specService)).toThrow(new NsError([], 'this is not based on an object'));
  });

  it('throws an error when creating with object as operationId', () => {
    expect(() => new Method(parent, Methods.post, { operationId: {} }, specService)).toThrow(new NsError([], '[operationId] must be a string and not empty'));
  });

  it('throws an error when creating with object as summary', () => {
    expect(() => new Method(parent, Methods.post, { operationId: 'hackThePlanet', summary: {} }, specService)).toThrow(
      new NsError([], '[summary] must be null or a string'),
    );
  });

  it('throws an error when creating with object as description', () => {
    expect(() => new Method(parent, Methods.post, { operationId: 'hackThePlanet', description: {} }, specService)).toThrow(
      new NsError([], '[description] must be null or a string'),
    );
  });

  it('throws an error when creating without reponses', () => {
    expect(() => new Method(parent, Methods.post, { operationId: 'hackThePlanet' }, specService)).toThrow(
      new NsError([], '[responses] mandatory property missing or empty'),
    );
  });

  it('throws an error when creating with reponses as array instead of map', () => {
    expect(() => new Method(parent, Methods.post, { operationId: 'hackThePlanet', responses: [] }, specService)).toThrow(
      new NsError([], '[responses] must be a map string -> object'),
    );
  });

  it('creates a new method', () => {
    const mockedResponse = mockDeep<Response>();
    const mockedParameter = mockDeep<Parameter>();
    const requestBodyMock = mockDeep<HttpContent>();
    const callbackMock = mockDeep<Callback>();
    jest.mocked(Response).mockReturnValueOnce(mockedResponse);
    jest.mocked(Parameter).mockReturnValueOnce(mockedParameter);
    jest.mocked(HttpContent).mockReturnValueOnce(requestBodyMock);
    jest.mocked(Callback).mockReturnValueOnce(callbackMock);

    const method = new Method(
      parent,
      Methods.post,
      {
        operationId: 'hackThePlanet',
        summary: 'Movie from 1995',
        description: 'https://www.imdb.com/title/tt0113243/',
        callbacks: { addwords: { callback: 'addwords' } },
        parameters: [{ parameter: 'filter' }],
        requestBody: { 'application/json': { body: 'json' } },
        responses: { 200: { response: 'ok' } },
      },
      specService,
    );

    expect(method.namespace).toEqual(['test', 'method: hackThePlanet (post)']);
    expect(method.parent).toEqual(parent);
    expect(method.method).toEqual(Methods.post);
    expect(method.summary).toEqual('Movie from 1995');
    expect(method.description).toEqual('https://www.imdb.com/title/tt0113243/');
    expect(method.operationId).toEqual('hackThePlanet');
    expect(method.parameters).toEqual([mockedParameter]);
    expect(method.requestBody).toEqual([requestBodyMock]);
    expect(method.responses).toEqual([mockedResponse]);
    expect(method.callbacks).toEqual([callbackMock]);
    expect(Response).toBeCalledWith(method, '200', { response: 'ok' }, specService);
    expect(HttpContent).toBeCalledWith(method, 'application/json', { body: 'json' }, specService);
    expect(Parameter).toBeCalledWith(method, { parameter: 'filter' }, specService);
    expect(Callback).toBeCalledWith(method, 'addwords', { callback: 'addwords' }, specService);
  });

  it('follows $ref', () => {
    const mockedResponse = mockDeep<Response>();
    jest.mocked(Response).mockReturnValueOnce(mockedResponse);

    specService.followRef.mockReturnValueOnce({ operationId: 'hackThePlanet', responses: { 200: { response: 'ok' } } });

    const method = new Method(parent, Methods.post, { $ref: '#/methods/hackThePlanet' }, specService);

    expect(method.namespace).toEqual(['test', 'method: hackThePlanet (post)']);
    expect(method.parent).toEqual(parent);
    expect(method.method).toEqual(Methods.post);
    expect(method.summary).toBeNull();
    expect(method.description).toBeNull();
    expect(method.operationId).toEqual('hackThePlanet');
    expect(method.parameters).toEqual([]);
    expect(method.requestBody).toEqual([]);
    expect(method.responses).toEqual([mockedResponse]);
    expect(method.callbacks).toEqual([]);
    expect(Response).toBeCalledWith(method, '200', { response: 'ok' }, specService);
    expect(specService.followRef).toBeCalledWith(method, '#/methods/hackThePlanet');
  });
});
