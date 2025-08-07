import re
from playwright.sync_api import Page, expect, sync_playwright

def test_p2p_chat(playwright: sync_playwright):
    """
    This test verifies the P2P chat functionality by opening two browser
    contexts and having them communicate with each other.
    """
    browser = playwright.chromium.launch()
    context1 = browser.new_context()
    context2 = browser.new_context()

    page1 = context1.new_page()
    page2 = context2.new_page()

    # 1. Arrange: Go to the homepage to get a room URL.
    page1.goto("http://localhost:3000")
    room_url = page1.url

    # 2. Arrange: Have the second user join the same room.
    page2.goto(room_url)

    # 3. Act: User 1 sends a message.
    page1.get_by_placeholder("Type a message...").fill("Hello from User 1!")
    page1.get_by_role("button", name="Send").click()

    # 4. Assert: User 2 receives the message.
    expect(page2.locator(".message").first).to_contain_text("Hello from User 1!")

    # 5. Act: User 2 sends a message.
    page2.get_by_placeholder("Type a message...").fill("Hello from User 2!")
    page2.get_by_role("button", name="Send").click()

    # 6. Assert: User 1 receives the message.
    expect(page1.locator(".message").last).to_contain_text("Hello from User 2!")

    # 7. Screenshot: Capture the final result for visual verification.
    page1.screenshot(path="jules-scratch/verification/verification1.png")
    page2.screenshot(path="jules-scratch/verification/verification2.png")

    browser.close()
