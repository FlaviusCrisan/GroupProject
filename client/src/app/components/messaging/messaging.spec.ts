import { describe, it, expect, vi } from 'vitest';
import { MessagingComponent } from './messaging';

function setup(send = vi.fn().mockResolvedValue(undefined)) {
  const api = { send_message: send, get_messages: vi.fn().mockResolvedValue([]) };
  const component = new MessagingComponent(api as any, { detectChanges: vi.fn() } as any);
  component.id = 'teammate';
  return { component, api };
}
describe('message delivery', () => {
  it('preserves the draft when the API cannot send it', async () => {
    const { component } = setup(vi.fn().mockRejectedValue(new Error('offline')));
    component.chat_message = 'Let�s play after 7';
    await component.send(new Event('submit'));
    expect(component.chat_message).toBe('Let�s play after 7');
    expect(component.error).toContain('not sent');
    expect(component.sending).toBe(false);
  });
  it('sends once and clears the draft only after success', async () => {
    let resolve!: () => void;
    const { component, api } = setup(vi.fn(() => new Promise<void>((done) => (resolve = done))));
    component.chat_message = '  Hello  ';
    const pending = component.send(new Event('submit'));
    await component.send(new Event('submit'));
    expect(api.send_message).toHaveBeenCalledTimes(1);
    expect(component.chat_message).toBe('  Hello  ');
    resolve();
    await pending;
    expect(component.chat_message).toBe('');
    expect(api.send_message).toHaveBeenCalledWith('teammate', 'Hello');
  });
});
