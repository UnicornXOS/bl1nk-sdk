import { renderTemplate } from './renderer';

describe('Template Renderer', () => {

  const template = JSON.stringify({
    query: "${{QUERY}}",
    limit: ${{LIMIT}},
    is_active: ${{IS_ACTIVE}}
  });

  const allowed = ['QUERY', 'LIMIT', 'IS_ACTIVE'];

  it('should render a valid template with correct props', () => {
    const props = {
      QUERY: "search for cats",
      LIMIT: 20,
      IS_ACTIVE: true
    };
    const { renderedJson } = renderTemplate(template, props, allowed);
    const result = JSON.parse(renderedJson);

    expect(result.query).toBe("search for cats");
    expect(result.limit).toBe(20);
    expect(result.is_active).toBe(true);
  });

  it('should throw an error for missing required props', () => {
    const props = {
      QUERY: "search for dogs"
    };
    expect(() => renderTemplate(template, props, allowed))
      .toThrow('Missing value for placeholder: LIMIT');
  });

  it('should throw an error for disallowed placeholders', () => {
    const badTemplate = '{"danger":"${{UNAUTHORIZED_PLACEHOLDER}}"}';
    const props = { UNAUTHORIZED_PLACEHOLDER: 'hacked' };
    
    expect(() => renderTemplate(badTemplate, props, allowed))
      .toThrow('Placeholder {{UNAUTHORIZED_PLACEHOLDER}} is not allowed');
  });
  
  it('should correctly escape string values in JSON', () => {
    const props = {
      QUERY: 'a "quoted" string with a \\ backslash',
      LIMIT: 5,
      IS_ACTIVE: false
    };
    const { renderedJson } = renderTemplate(template, props, allowed);
    const result = JSON.parse(renderedJson);
    
    // JSON.parse จะจัดการ un-escaping ให้ เราแค่เช็คว่าค่าตรงกัน
    expect(result.query).toBe('a "quoted" string with a \\ backslash');
  });

});
