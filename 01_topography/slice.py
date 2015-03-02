#!/usr/bin/env python
import math
import sys


def floor_pow10(value):
    """Similar to math.floor() but to a power of 10.
    >>> floor_pow10(42)
    10
    """
    return 10 ** int(math.log10(value))


def ceil_pow10(value):
    """Similar to math.ceil() but to a power of 10.
    >>> floor_pow10(42)
    100
    """
    return 10 ** math.ceil(math.log10(value))


def slice_linear(zmin, zmax, n, scale=None):
    """The size of result is (n-1)."""
    COMBS = [
        None,  # not used
        (0, ),
        (0, 5, ),
        (0, 3, 7, ),
        (0, 3, 5, 7, ),
        (0, 2, 4, 6, 8, ),
        (0, 2, 3, 5, 7, 8, ),
        (0, 1, 3, 4, 6, 7, 9, ),
        (0, 1, 3, 4, 5, 6, 7, 9, ),
        (0, 1, 2, 3, 4, 6, 7, 8, 9, ),
        (0, 1, 2, 3, 4, 5, 6, 7, 8, 9, ),
    ]
    if scale is None:
        scale = 10 * ceil_pow10((zmax - zmin) / n)
    step = scale // 10
    def generate(comb, bases):
        if comb is None:
            return []
        result = [base + _ * step for base in bases for _ in comb]
        return [_ for _ in result if zmin < _ < zmax]
    zmin_floored = math.floor(zmin - math.fmod(zmin, scale))  # XXX: these might be numerically unstable
    zmax_ceiled = math.ceil(zmax - math.fmod(zmax, scale))
    multiples = list(range(zmin_floored, zmax_ceiled + scale, scale))
    multiples = [_ for _ in multiples if zmin < _ < zmax]
    if len(multiples) == 0:
        k = (zmax_ceiled - zmin_floored) // step
        if k == 0:
            return slice_linear(zmin, zmax, n, scale=(scale // 10))
        result = generate(COMBS[k], [zmin_floored])
        # TODO: compensate len(result) to be == (n - 1)
        return result
    k = n // len(multiples)
    if k <= 0:
        return []
    if k > 10:
        return slice_linear(zmin, zmax, n, scale=(scale // 10))
    result_body = generate(COMBS[k], multiples[:-1])
    result_head = []
    result_tail = []
    # len(result_head + result_body + result_tail) should be == (n - 1)
    len_needed = (n - 1) - len(result_body)
    assert len_needed >= 0
    head_length = len_needed // 2
    tail_length = (len_needed + 1) // 2
    for comb in COMBS[:(k + 1)]:
        candidate = generate(comb, [multiples[0] - scale])
        if len(candidate) == head_length:
            result_head = candidate
        candidate = generate(comb, [multiples[-1]])
        if len(candidate) == tail_length:
            result_tail = candidate
    result = result_head + result_body + result_tail
    if len(result) != (n - 1):
        # n is too large  (e.g. zmin = 10, zmax = 1000, n = 50)
        # Once again, do the linear slicing instead
        return slice_linear(zmin, zmax, n, scale=(scale // 10))
    return result


def slice(zmin, zmax, n=6):
    """The size of result is (n-1)."""
    COMBS = [
        None,  # not used
        (1, ),
        (1, 3, ),
        (1, 2, 5, ),
        (1, 2, 3, 6, ),
        (1, 2, 3, 4, 6, ),
        (1, 2, 3, 4, 5, 7, ),
        (1, 2, 3, 4, 5, 6, 7, ),
        (1, 2, 3, 4, 5, 6, 7, 8, ),
        (1, 2, 3, 4, 5, 6, 7, 8, 9, ),
    ]
    def generate(comb, bases):
        if len(bases) == 0:
            return []
        if comb is None:
            return []
        result = [_ * base for base in bases for _ in comb]
        return [_ for _ in result if zmin < _ < zmax]
    if zmin < 0:
        return [0] + slice(0, zmax, n - 1)
    log_zmax = math.log10(zmax)
    if zmin > 0:
        log_zmin = math.log10(zmin)
    else:
        log_zmin = math.ceil(log_zmax - (n // 4))
        if log_zmin < 2:
            # 10 is the minimum; if it could't make it, will fall back to slice_linear()
            log_zmin = 2
    # powers of 10 between.  e.g. If zmin = 5 and zmax = 200, powers = [10, 100]
    powers = [10 ** r for r in list(range(int(log_zmin), int(log_zmax) + 1))]
    powers = [_ for _ in powers if zmin < _ < zmax]
#    if (len(powers) <= 1) or ((n - 1) >= 9 * len(powers)):
    if len(powers) == 0:
        # (zmax - zmin) is too small compared to zmin.  (e.g. zmin = 1900, zmax = 2100)
        # Do the linear slicing instead
        return slice_linear(zmin, zmax, n)
    k = n // (len(powers) + 1)
    result_body = generate(COMBS[k], powers[:-1])
    result_head = []
    result_tail = []
    # len(result_head + result_body + result_tail) should be == (n - 1)
    len_needed = (n - 1) - len(result_body)
    assert len_needed >= 0
    head_length = (len_needed + 1) // 2
    tail_length = len_needed // 2
    for comb in COMBS[:(k + 1)]:
        candidate = generate(comb, [powers[0] // 10])
        if len(candidate) == head_length:
            result_head = candidate
        candidate = generate(comb, [powers[-1]])
        if len(candidate) == tail_length:
            result_tail = candidate
    result = result_head + result_body + result_tail
    if len(result) != (n - 1):
        # n is too large  (e.g. zmin = 10, zmax = 1000, n = 50)
        # Once again, do the linear slicing instead
        return slice_linear(zmin, zmax, n)
    return result


def test(input_, output):
    import traceback
    zmin, zmax, n = input_
    try:
        output_got = slice(zmin, zmax, n)
    except:
        print("(zmin={}, zmax={}, n={})".format(zmin, zmax, n))
        traceback.print_exc()
        return
    if len(output) == len(output_got) and all(x == y for (x, y) in zip(output, output_got)):
        print("PASSED: (zmin={}, zmax={}, n={}) -> {}".format(zmin, zmax, n, output))
        return
    print("")
    print("FAILED.")
    print("(zmin={}, zmax={}, n={})".format(zmin, zmax, n))
    print("Expected: {}".format(output))
    print("Got: {}".format(output_got))
    print("")


def main():
    if len(sys.argv) == 4:
        zmin, zmax, n = sys.argv[1:]
        zmin = int(zmin)
        zmax = int(zmax)
        n = int(n)
        print(" ".join(str(_) for _ in slice(zmin, zmax, n)))
        return
    print("Usage: ./{} zmin zmax n_of_color".format(sys.argv[0]))
    print("Returns the contour lines to be drawn, should be one less than number of color.")
    print("TESTING...")
    test((0, 9000, 6), [100, 200, 500, 1000, 3000])
    test((0, 9000, 10), [10, 20, 50, 100, 200, 500, 1000, 2000, 5000])
    test((-10, 50, 6), [0, 10, 20, 30, 40])
    test((0, 200, 5), [30, 70, 100, 150])
    test((0, 200, 10), [20, 40, 60, 80, 100, 120, 140, 160, 180])
    test((1158, 1202, 6), [1160, 1170, 1180, 1190, 1200])


if __name__ == '__main__':
    main()
