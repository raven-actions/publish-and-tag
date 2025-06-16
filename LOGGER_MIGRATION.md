# Logger Migration: Signale → Pino

## Overview

This document describes the migration from Signale to Pino logger in the actions-toolkit package.

## Why the Migration?

### Problems with Signale

- **Outdated**: Signale hasn't been actively maintained
- **ESM Issues**: Poor support for ESM modules
- **Performance**: Slower than modern alternatives
- **Dependencies**: Outdated dependency tree

### Benefits of Pino

- **Performance**: Significantly faster logging performance
- **ESM Native**: Full ESM module support out of the box
- **Maintained**: Actively developed and widely adopted
- **Structured Logging**: JSON-based structured logging
- **Ecosystem**: Rich ecosystem of plugins and transports
- **GitHub Actions Integration**: Seamless integration with GitHub Actions core functions

## Migration Details

### Key Changes

1. **New Logger Class**: Created `packages/actions-toolkit/src/logger.ts`
   - Pino-based logger with Signale-compatible API
   - GitHub Actions integration using `@actions/core`
   - Maintains backward compatibility with existing code

2. **Updated Exports**: Modified `packages/actions-toolkit/src/index.ts`
   - Added exports for `Logger`, `LoggerFunc`, and `createLogger`
   - Updated type definitions

3. **Test Updates**: Refactored all test files
   - Updated `packages/actions-toolkit/tests/index.test.ts`
   - Updated `packages/actions-toolkit/tests/exit.test.ts`
   - Updated `tests/helpers.ts`
   - Changed mocking strategy to use `jest.spyOn`

4. **Type Safety**: Maintained TypeScript compatibility
   - Proper type exports with `export type` for isolated modules
   - Compatible interfaces with existing Toolkit class

### API Compatibility

The new logger maintains compatibility with the existing Signale API:

```typescript
// Core logging methods (unchanged)
logger.info('message')
logger.debug('message')
logger.warn('message')
error.error('message')
logger.fatal('message')

// Signale-specific methods (maintained)
logger.success('message')  // ✅ with emoji
logger.complete('message') // ✅ with emoji

// Utility methods
logger.disable()
logger.enable()
logger.isEnabled()
logger.addSecrets(['secret1', 'secret2'])
logger.clearSecrets()
```

### GitHub Actions Integration

The logger automatically detects GitHub Actions environment and:

- Routes logs through `@actions/core` functions (`core.info`, `core.debug`, etc.)
- Supports GitHub Actions log grouping and formatting
- Handles secret masking via `core.setSecret()`

### Configuration Options

```typescript
interface LoggerOptions {
  disabled?: boolean     // Disable all logging
  level?: LogLevel      // Set minimum log level
  prettyPrint?: boolean // Enable pretty printing (development)
}

// Usage
const logger = createLogger({
  disabled: true,        // For tests
  level: 'debug',       // Set log level
  prettyPrint: true     // Pretty print in development
})
```

## Files Modified

### Core Package Files

- `packages/actions-toolkit/src/logger.ts` - **NEW**: Modern Pino-based logger
- `packages/actions-toolkit/src/index.ts` - Updated exports and constructor
- `packages/actions-toolkit/src/exit.ts` - Updated import and type references
- `packages/actions-toolkit/package.json` - Updated dependencies

### Test Files

- `packages/actions-toolkit/tests/index.test.ts` - Updated all Signale references
- `packages/actions-toolkit/tests/exit.test.ts` - Updated mocking approach
- `tests/helpers.ts` - Updated test toolkit creation

### Removed Files

- `packages/actions-toolkit/src/@types/signale/index.d.ts` - No longer needed

## Dependencies

### Removed

```json
{
  "signale": "^1.4.0",
  "@types/signale": "^1.4.7"
}
```

### Added

```json
{
  "pino": "^9.7.0",
  "pino-pretty": "^12.0.0"
}
```

## Performance Benefits

- **Faster Initialization**: Pino has minimal startup overhead
- **Better Performance**: JSON-based logging is significantly faster
- **Memory Efficient**: Lower memory footprint than Signale
- **Async-Friendly**: Better support for async logging scenarios

## Backward Compatibility

✅ **Fully backward compatible** - existing code continues to work without changes:

```typescript
// This continues to work exactly as before
const toolkit = new Toolkit()
toolkit.log('Hello')           // Callable logger
toolkit.log.success('Done!')   // Success with emoji
toolkit.exit.failure('Error')  // Exit with logging
```

## Testing

All existing tests pass with the new logger implementation. The migration includes:

- Updated test mocking strategies using `jest.spyOn`
- Maintained test snapshots compatibility
- Enhanced test coverage for new logger features

## Future Enhancements

The Pino-based implementation enables several future improvements:

1. **Structured Logging**: Easy addition of structured data to logs
2. **Log Streaming**: Support for various output streams and transports
3. **Performance Monitoring**: Built-in performance tracking capabilities
4. **Custom Formatters**: Easy customization of log output formats
5. **Log Levels**: Granular control over logging levels per environment

This migration provides a solid foundation for modern, performant logging while maintaining full backward compatibility with existing code.
