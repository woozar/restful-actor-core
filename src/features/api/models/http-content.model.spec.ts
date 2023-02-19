import { DeepMockProxy, mockDeep } from 'jest-mock-extended';
import { NsError } from '../../../ns-error';
import { ApiSpecsService } from '../api-specs.service';
import { HttpContent } from './http-content.model';
import { Method } from './method.model';

jest.mock('./callback-url.model');

describe('Http Content', () => {
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

  it('throws an error when creating with empty mimetype', () => {
    expect(() => new HttpContent(parent, '', {}, specService)).toThrow(new NsError([], '[mimetype] must be a string and not empty'));
  });

  it('throws an error when creating without rawData', () => {
    expect(() => new HttpContent(parent, 'mimetype', null, specService)).toThrow(new NsError([], 'this is not based on an object'));
  });

  it('throws an error when creating with stringified rawData', () => {
    expect(() => new HttpContent(parent, 'mimetype', 'null', specService)).toThrow(new NsError([], 'this is not based on an object'));
  });

  it('throws an error when creating without schema', () => {
    expect(() => new HttpContent(parent, 'mimetype', {}, specService)).toThrow(new NsError([], '[schema] mandatory property missing or empty'));
  });

  it('throws an error when creating with schema as string', () => {
    expect(() => new HttpContent(parent, 'mimetype', { schema: JSON.stringify({ type: 'string' }) }, specService)).toThrow(
      new NsError([], '[schema] is not a object but a string'),
    );
  });

  it('throws an error when creating with description object', () => {
    expect(() => new HttpContent(parent, 'mimetype', { schema: { type: 'string' }, description: {} }, specService)).toThrow(
      new NsError([], '[description] must be null or a string'),
    );
  });

  it('creates a new http content', () => {
    const httpContent = new HttpContent(parent, 'application/json', { schema: { type: 'string' }, description: 'descr', example: 'asd' }, specService);

    expect(httpContent.namespace).toEqual(['test', 'content: application/json']);
    expect(httpContent.parent).toEqual(parent);
    expect(httpContent.description).toEqual('descr');
    expect(httpContent.example).toEqual('"asd"');
    expect(httpContent.mimetype).toEqual('application/json');
    expect(httpContent.rawSchema).toEqual({ type: 'string' });
    expect(httpContent.schema).toEqual(JSON.stringify({ type: 'string' }));
  });

  it('creates a new http content with a $ref to its schema', () => {
    specService.followRef.mockReturnValueOnce({ type: 'string' });

    const httpContent = new HttpContent(parent, 'application/json', { schema: { $ref: '#/schema/bar' } }, specService);

    expect(httpContent.description).toBeNull();
    expect(httpContent.example).toBeNull();

    expect(httpContent.rawSchema).toEqual({ type: 'string' });
    expect(httpContent.schema).toEqual(JSON.stringify({ type: 'string' }));
    expect(specService.followRef).toBeCalledWith(httpContent, '#/schema/bar');
    expect(specService.followRef).toBeCalledTimes(1);
  });

  it('follows $ref', () => {
    specService.followRef.mockReturnValueOnce({ schema: { type: 'string' }, description: 'descr', example: 'asd' });
    const httpContent = new HttpContent(parent, 'application/json', { $ref: '#/contents/the-right-one' }, specService);

    expect(httpContent.namespace).toEqual(['test', 'content: application/json']);
    expect(httpContent.parent).toEqual(parent);
    expect(httpContent.description).toEqual('descr');
    expect(httpContent.example).toEqual('"asd"');
    expect(httpContent.mimetype).toEqual('application/json');
    expect(httpContent.rawSchema).toEqual({ type: 'string' });
    expect(httpContent.schema).toEqual(JSON.stringify({ type: 'string' }));
    expect(specService.followRef).toBeCalledWith(httpContent, '#/contents/the-right-one');
  });
});
