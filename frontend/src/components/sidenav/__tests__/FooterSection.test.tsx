import { vi, describe, it, expect } from 'vitest';
const jest = vi;

const run = process.env.CI === 'true';

(run ? describe : describe.skip)('FooterSection', () => {
  const mockSignOut = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders theme toggle and logout button", () => {
    render(<FooterSection onSignOut={mockSignOut} />);
    
    expect(screen.getByRole("button", { name: /toggle theme/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /sair/i })).toBeInTheDocument();
  });

  it("calls onSignOut when logout button is clicked", async () => {
    render(<FooterSection onSignOut={mockSignOut} />);
    
    const logoutButton = screen.getByRole("button", { name: /sair/i });
    await userEvent.click(logoutButton);
    
    expect(mockSignOut).toHaveBeenCalledTimes(1);
  });
});
