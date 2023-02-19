import { DeepMockProxy, mockDeep } from 'jest-mock-extended';
import { NsError } from '../../../ns-error';
import { ApiSpecsService } from '../api-specs.service';
import { HttpContent } from './http-content.model';
import { HttpHeader } from './http-header.model';
import { Method } from './method.model';
import { Response } from './response.model';

jest.mock('./http-content.model');
jest.mock('./http-header.model');

describe('Response', () => {
  let specService: DeepMockProxy<ApiSpecsService>;
  let parent: DeepMockProxy<Method>;

  beforeEach(() => {
    specService = mockDeep<ApiSpecsService>();
    parent = mockDeep<Method>({ namespace: ['test'] });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  it('throws an error when creating with empty path', () => {
    expect(() => new Response(parent, undefined as any, {}, specService)).toThrow(new NsError([], 'code must be a number or an integer serialized as string'));
  });

  it('throws an error when creating with empty path', () => {
    expect(() => new Response(parent, '', {}, specService)).toThrow(new NsError([], 'code must be a number or an integer serialized as string'));
  });

  it('throws an error when creating without rawData', () => {
    expect(() => new Response(parent, 200, null, specService)).toThrow(new NsError([], 'this is not based on an object'));
  });

  it('throws an error when creating with stringified rawData', () => {
    expect(() => new Response(parent, 200, 'null', specService)).toThrow(new NsError([], 'this is not based on an object'));
  });

  it('throws an error when creating with invalid content', () => {
    expect(() => new Response(parent, 200, { content: ' ' }, specService)).toThrow(new NsError([], '[content] must be a map string -> object'));
  });

  it('throws an error when creating with  content array', () => {
    expect(() => new Response(parent, 200, { content: [] }, specService)).toThrow(new NsError([], '[content] must be a map string -> object'));
  });

  it('throws an error when creating with description object', () => {
    expect(() => new Response(parent, 200, { post: {}, description: {} }, specService)).toThrow(new NsError([], '[description] must be null or a string'));
  });

  it('throws an error when creating with summary object', () => {
    expect(() => new Response(parent, 200, { post: {}, summary: {} }, specService)).toThrow(new NsError([], '[summary] must be null or a string'));
  });

  it('creates a new response', () => {
    const mockedContent = mockDeep<HttpContent>();
    const mockedHeader = mockDeep<HttpHeader>();
    jest.mocked(HttpContent).mockReturnValueOnce(mockedContent);
    jest.mocked(HttpHeader).mockReturnValueOnce(mockedHeader);

    const response = new Response(
      parent,
      200,
      {
        summary: 'the path to good',
        description: 'a long and narrow path',
        content: { 'application/json': { content: 'json' } },
        headers: { cookie: { header: 'cookie!' } },
      },
      specService,
    );

    expect(response.namespace).toEqual(['test', 'response: 200']);
    expect(response.parent).toEqual(parent);
    expect(response.summary).toEqual('the path to good');
    expect(response.description).toEqual('a long and narrow path');
    expect(response.contents).toEqual([mockedContent]);
    expect(response.headers).toEqual([mockedHeader]);
    expect(HttpContent).toBeCalledWith(response, 'application/json', { content: 'json' }, specService);
    expect(HttpHeader).toBeCalledWith(response, 'cookie', { header: 'cookie!' }, specService);
  });

  it('follows $ref', () => {
    specService.followRef.mockReturnValueOnce({});

    const response = new Response(parent, '200', { $ref: '#/responses/foobar' }, specService);

    expect(response.namespace).toEqual(['test', 'response: 200']);
    expect(response.parent).toEqual(parent);
    expect(response.summary).toBeNull();
    expect(response.description).toBeNull();
    expect(response.contents).toEqual([]);
    expect(response.headers).toEqual([]);

    expect(specService.followRef).toBeCalledWith(response, '#/responses/foobar');
  });
});
