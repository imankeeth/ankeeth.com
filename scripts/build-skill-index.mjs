import { createHash } from 'node:crypto';
import { readFile, writeFile } from 'node:fs/promises';
const name = 'read-ankeeth-portfolio';
const path = `/.well-known/agent-skills/${name}/SKILL.md`;
const skill = await readFile(`dist${path}`);
const description = skill.toString().match(/^description: (.+)$/m)?.[1];
if (!description) throw new Error('Skill description missing');
await writeFile('dist/.well-known/agent-skills/index.json', JSON.stringify({
  $schema: 'https://schemas.agentskills.io/discovery/0.2.0/schema.json',
  skills: [{ name, description, type: 'skill-md', url: `https://ankeeth.com${path}`, digest: `sha256:${createHash('sha256').update(skill).digest('hex')}` }],
}, null, 2) + '\n');
