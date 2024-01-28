# @chinaza/honey

## 1.24.4

### Patch Changes

- Patch

## 1.24.3

### Patch Changes

- Patch

## 1.24.2

### Patch Changes

- Patch

## 1.24.1

### Patch Changes

- Patch

## 1.24.0

### Minor Changes

- 7a4e415: update dependencies

## 1.23.1

### Patch Changes

- Patch

## 1.23.0

### Minor Changes

- 6d54494: add upsert and update controllers

## 1.22.3

### Patch Changes

- 1d537f5: fix issue with upsert

## 1.22.2

### Patch Changes

- Patch

## 1.22.1

### Patch Changes

- Patch

## 1.22.0

### Minor Changes

- d28cd30: add support for upsert

## 1.21.3

### Patch Changes

- 36a36f3: fix unreachable code

## 1.21.2

### Patch Changes

- 9bb4921: fix

## 1.21.1

### Patch Changes

- 1c456d7: make req param in processResponseData compulsory

## 1.21.0

### Minor Changes

- e9ae5d5: add request object to process response data

## 1.20.1

### Patch Changes

- 9b7cead: only log response in non-prod to reduce noise

## 1.20.0

### Minor Changes

- 3fe7e9f: remove duplicate code and specify default exit middleware for logging response

## 1.19.0

### Minor Changes

- 27628ba: add support for response data preprocessing

## 1.18.1

### Patch Changes

- 887a3f3: fix

## 1.18.0

### Minor Changes

- e0bfb0f: add full support for raw routes

## 1.17.2

### Patch Changes

- 821421e: expose express raw only

## 1.17.1

### Patch Changes

- 74b8130: expose express

## 1.17.0

### Minor Changes

- 573a9d1: make update and create params optional

## 1.16.1

### Patch Changes

- f656269: return pagination only when used

## 1.16.0

### Minor Changes

- 449a01b: remove GET filters when not present in query params

## 1.15.6

### Patch Changes

- e2289fa: fix table supporting casing

## 1.15.5

### Patch Changes

- fc2fd51: make get query filter optional

## 1.15.4

### Patch Changes

- 61f6c43: fix json formatting for update queriess

## 1.15.3

### Patch Changes

- 77ec734: fix typescript error

## 1.15.2

### Patch Changes

- cc75e3a: do not format json

## 1.15.1

### Patch Changes

- c870306: do not format json

## 1.15.0

### Minor Changes

- fbfeb34: add support for json datatype

## 1.14.3

### Patch Changes

- ce78005: init model

## 1.14.2

### Patch Changes

- 874e3e0: fix binding in model creator

## 1.14.1

### Patch Changes

- 10bc2ba: bind ModelCreator

## 1.14.0

### Minor Changes

- 3eaaf64: add model creator

## 1.13.5

### Patch Changes

- d8b072d: fix function naming

## 1.13.4

### Patch Changes

- d35cf32: fix

## 1.13.3

### Patch Changes

- 54aa6f7: expose express

## 1.13.2

### Patch Changes

- 30d38f0: add more exposed types

## 1.13.1

### Patch Changes

- bc6b6a9: expose all sequelize types

## 1.13.0

### Minor Changes

- bae12c1: refactor for early init of sequelize

## 1.12.0

### Minor Changes

- e4a0c22: add data override for create response and expose http error utility methods

## 1.11.0

### Minor Changes

- ff95bcf: fix race condition and remove params from setupDB call

## 1.10.2

### Patch Changes

- 5c3e838: fix binding for config export

## 1.10.1

### Patch Changes

- b4bc78d: avoid duplicate db connections

## 1.10.0

### Minor Changes

- 082e063: expose db setup

## 1.9.0

### Minor Changes

- ec2d1ee: change response structure for post requests

## 1.8.2

### Patch Changes

- 3c958a1: make params in db query optional

## 1.8.1

### Patch Changes

- e5f5e1a: make replacements optional in db query util

## 1.8.0

### Minor Changes

- 702bf79: add raw db querying utility

## 1.7.0

### Minor Changes

- 1157337: add id field support to update by id

## 1.6.0

### Minor Changes

- 6dc1c38: add jsdoc for fields and fix middleware return type

## 1.5.5

### Patch Changes

- ef81f03: remove duplicate middleware declaration

## 1.5.4

### Patch Changes

- 8f255d8: grant write permission to GH action
- 8cb3cd5: fix GH Actions
- 8bf547b: fix GH actions
- 794d0bd: fix GH action
- d1e2482: extend middleware interface to support data param

## 1.5.0

### Minor Changes

- return id on data creation requests

## 1.4.1

### Patch Changes

- specify exit middleware type

## 1.4.0

### Minor Changes

- add support for exit Middleware

## 1.3.3

### Patch Changes

- fix routePrefix declaration

## 1.3.2

### Patch Changes

- change metadata interface for createHoney to include routePrefix

## 1.3.1

### Patch Changes

- refactor path prefixing moving default api prefix to the root level

## 1.3.0

### Minor Changes

- add the ability to override paths
