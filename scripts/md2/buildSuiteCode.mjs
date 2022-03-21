import template from '@babel/template';
import {header, describeCase} from './templateFragement.mjs';
import * as t from '@babel/types';
import {promises as fs} from 'fs';
import generate from '@babel/generator';

/**
 * Build corresponding jest code for code snippets using meta infos.
 * @param metaQueue {object[]} The mate infos (refers to scripts/md2/metaSchema.mjs for details)
 * @returns {void}
 */
export default async (metaQueue) => {
  if (metaQueue.length === 0) {
    console.log('No meta infos collected, skip');
  }

  const describedCases = [];

  // The first element always refers to the object describing a group.
  const dirName = metaQueue[0].name;

  for (let i = 1; i < metaQueue.length; i++) {
    let thisMeta = metaQueue[i];

    // Setup analyse and retrieve variables needs to be tested.
    const beforeAllContent = [];
    beforeAllContent.push(
      template.default.ast(`await analyse('tests/cases/_${dirName}/_${thisMeta.name}.${thisMeta.module ? 'mjs' : 'js'}')`)
    );
    let capturedStatement;
    if (thisMeta.entities.filter) {
      capturedStatement = template.default.ast(`captured = global.eContainer.all.filter(e => e.type === '${thisMeta.entities.filter}')`);
    } else {
      capturedStatement = template.default.ast(`captured = global.eContainer.all`);
    }
    beforeAllContent.push(capturedStatement);

    const describeCaseBody = [];

    for (const [j, ent] of thisMeta.entities.items.entries()) {
      let doTest;
      switch (ent.type) {
        case 'variable':
          doTest = testEntityVariable(thisMeta.entities, j, ent);
          break;
        case 'function':
          doTest = testEntityFunction(thisMeta.entities.exact, j, ent);
          break;
      }
      describeCaseBody.push(doTest);
    }

    describedCases.push(describeCase({
      name: t.stringLiteral(thisMeta.name),
      beforeAll: t.blockStatement(beforeAllContent),
      tests: describeCaseBody,
    }));
  }

  /**
   * Only create suite file if it does contain at least 1 valid testcase.
   */
  if (describedCases.length !== 0) {
    const outerDescribe = t.callExpression(
      t.identifier('describe'),
      [
        t.stringLiteral(dirName),
        t.arrowFunctionExpression(
          [],
          t.blockStatement(describedCases),
        )
      ]
    );

    const ast = header({body: outerDescribe});

    try {
      await fs.writeFile(`tests/suites/_${dirName}.test.js`, generate.default(ast).code);
      console.log(`Generated suite: ${dirName}`);
    } catch (e) {
      console.error(e);
    }
  }
};

// TODO: Non-exact mode

const testEntityVariable = (exact, index, ent) => {
  if (exact) {
    return template.default.ast(`
    test('contains entity ${ent.name}', () => {
      const ent = captured[${index}];
      expect(ent.name.printableName).toBe('${ent.name}');
      expect(expandENRELocation(ent)).toEqual(buildFullLocation(${ent.loc[0]}, ${ent.loc[1]}, ${ent.name.length}));
      expect(ent.kind).toBe('${ent.kind}');
    })
    `)
  } else {

  }
}

const testEntityFunction = (exact, index, ent) => {
  if (exact) {
    return template.default.ast(`
    test('contains entity ${ent.name}', () => {
      const ent = captured[${index}];
      expect(ent.name.printableName).toBe('${ent.name}');
      expect(expandENRELocation(ent)).toEqual(buildFullLocation(${ent.loc[0]}, ${ent.loc[1]}, ${ent.loc[2]}));
      expect(ent.isAsync).toBe(${ent.async || false});
      expect(ent.isGenerator).toBe(${ent.generator || false});
    })
    `)
  } else {

  }
}