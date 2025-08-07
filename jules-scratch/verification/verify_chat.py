import re
from playwright.sync_api import Page, expect

def test_chat_functionality(page: Page):
    """
    This test verifies the chat functionality, including sending messages
    and toggling anonymous mode.
    """
    # 1. Arrange: Go to the homepage.
    page.goto("http://localhost:3000")

    # 2. Assert: Check that we've been redirected to a chat room.
    expect(page).to_have_url(re.compile(r"http://localhost:3000/[a-f0-9-]+"))

    # 3. Act: Send a message.
    page.get_by_placeholder("Type a message...").fill("Hello, world!")
    page.get_by_role("button", name="Send").click()

    # 4. Assert: Verify the message appears with the correct alias.
    expect(page.locator(".message").first).to_contain_text("User 1: Hello, world!")

    # 5. Act: Enable anonymous mode.
    page.get_by_label("Anonymous Mode").check()

    # 6. Act: Send another message.
    page.get_by_placeholder("Type a message...").fill("This is an anonymous message.")
    page.get_by_role("button", name="Send").click()

    # 7. Assert: Verify the second message appears as "Anonymous".
    expect(page.locator(".message").last).to_contain_text("Anonymous: This is an anonymous message.")

    # 8. Screenshot: Capture the final result for visual verification.
    page.screenshot(path="jules-scratch/verification/verification.png")
