import { afterEach, describe, expect, it, vi } from 'vitest';
import { createBrowserHistory } from './history';

afterEach(() => {
  window.history.replaceState(null, '', '/');
});

describe('createBrowserHistory', () => {
  it('adds or replaces entries, and tells its subscribers', () => {
    window.history.replaceState(null, '', '/');
    const history = createBrowserHistory(window);
    const listener = vi.fn();
    const unsubscribe = history.subscribe(listener);
    const length = window.history.length;

    history.navigate('/home?debug', { state: { from: '/' } });
    expect(history.location()).toEqual({
      pathname: '/home',
      search: '?debug',
      hash: '',
      state: { from: '/' },
    });
    expect(window.history.length).toBe(length + 1);

    history.navigate('/work', { replace: true });
    expect(history.location().pathname).toBe('/work');
    expect(window.history.length).toBe(length + 1);
    expect(listener).toHaveBeenCalledTimes(2);
    unsubscribe();
  });

  it('follows the browser moves: Back arrives through popstate', async () => {
    window.history.replaceState(null, '', '/');
    const history = createBrowserHistory(window);
    const listener = vi.fn();
    history.subscribe(listener);
    history.navigate('/work');
    history.back();
    await vi.waitFor(() => {
      expect(history.location().pathname).toBe('/');
    });
    expect(listener).toHaveBeenCalledTimes(2);
  });

  it('keeps the same snapshot until the address moves', () => {
    const history = createBrowserHistory(window);
    const first = history.location();
    const unsubscribe = history.subscribe(() => undefined);
    expect(history.location()).toBe(first);
    unsubscribe();
  });

  it('only listens to popstate while someone is subscribed', () => {
    const add = vi.spyOn(window, 'addEventListener');
    const remove = vi.spyOn(window, 'removeEventListener');
    const history = createBrowserHistory(window);
    const first = history.subscribe(() => undefined);
    const second = history.subscribe(() => undefined);
    expect(add.mock.calls.filter(([type]) => type === 'popstate')).toHaveLength(1);
    first();
    expect(remove.mock.calls.filter(([type]) => type === 'popstate')).toHaveLength(0);
    second();
    expect(remove.mock.calls.filter(([type]) => type === 'popstate')).toHaveLength(1);
  });
});
