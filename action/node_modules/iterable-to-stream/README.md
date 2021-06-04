# iterable-to-stream

Convert iterable objects into node readable streams.

```typescript
import iterableToStream from 'iterable-to-stream';

iterableToStream(['one', 'two', 'three']).pipe(process.stdout);
```

## Note

With version 10, Node introduced [stream.Readable.from](https://nodejs.org/dist/latest-v16.x/docs/api/stream.html#stream_stream_readable_from_iterable_options)
which converts an iterator to a stream.

This library will use the Node version if it is available.

## Notice of Deprecation

This library will be deprecated when Node 12 is deprecated.

## Supported Node Versions

-   12.x, 14.x, 15.x
-   Unsupported, but should still work: 8.x, 10.x
